// src/screens/HistorialScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput, // <-- Importado para la búsqueda
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/shared/Header';
import { Colors, BorderRadius } from '../theme/colors';
import PedidoStatusTracker from '../components/PedidoStatusTracker';

const filters = ['Todos', 'Últimos 30 días', 'Este mes', 'Pasados'];

interface Transaction {
  id: string;
  name: string;
  restaurant: string;
  date: Date;
  amount: number;
  status: 'ok' | 'pending';
  points: number;
}

const getRelativeDate = (daysAgo: number, hours: number = 12, minutes: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const transactionsData: Transaction[] = [
  { id: '1', name: 'Artisan Salad Bowl', restaurant: 'FoodPass — Sede Centro', date: getRelativeDate(0, 12, 34), amount: 18.25, status: 'ok', points: 18 },
  { id: '2', name: 'FoodPass Signature Burger', restaurant: 'FoodPass — Sede Norte', date: getRelativeDate(1, 13, 5), amount: 14.50, status: 'ok', points: 14 },
  { id: '3', name: 'Kyoto Ramen Bowl', restaurant: 'FoodPass — Sede Centro', date: getRelativeDate(6, 12, 45), amount: 21.50, status: 'ok', points: 21 },
  { id: '4', name: 'Morning Delight Toast', restaurant: 'FoodPass — Cafetería', date: getRelativeDate(12, 8, 15), amount: 12.75, status: 'ok', points: 12 },
  { id: '5', name: 'Pizza Margherita Luxe', restaurant: 'FoodPass — Sede Sur', date: getRelativeDate(35, 13, 20), amount: 19.00, status: 'pending', points: 19 },
  { id: '6', name: 'Pasta del Huerto', restaurant: 'FoodPass — Sede Centro', date: getRelativeDate(45, 12, 55), amount: 16.00, status: 'ok', points: 16 },
];

const formatTxDate = (date: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  if (diffDays === 0 && date.getDate() === now.getDate()) return `Hoy, ${timeStr}`;
  if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) return `Ayer, ${timeStr}`;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
};

const formatCurrency = (val: number) => val.toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function HistorialScreen() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  
  // --- NUEVOS ESTADOS PARA BÚSQUEDA ---
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filtrado Combinado (Tiempo + Búsqueda)
  const filteredTransactions = useMemo(() => {
    return transactionsData.filter((item) => {
      const timeDiff = Date.now() - item.date.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      let matchesTime = true;
      if (activeFilter === 'Últimos 30 días') matchesTime = daysDiff <= 30;
      else if (activeFilter === 'Este mes') {
        const now = new Date();
        matchesTime = item.date.getMonth() === now.getMonth() && item.date.getFullYear() === now.getFullYear();
      }
      else if (activeFilter === 'Pasados') matchesTime = daysDiff > 30;

      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                            item.restaurant.toLowerCase().includes(searchText.toLowerCase());

      return matchesTime && matchesSearch;
    });
  }, [activeFilter, searchText]);

  const stats = useMemo(() => {
    const pointsSum = filteredTransactions.reduce((sum, item) => sum + item.points, 0);
    let baseOrders = 122;
    let baseSavings = 1400;
    const totalPedidos = baseOrders + filteredTransactions.length;
    const totalAhorro = baseSavings + (pointsSum * 0.5);
    const ordersLeft = Math.max(1, 5 - (totalPedidos % 5));
    return { totalPedidos, totalAhorro, ordersLeft };
  }, [filteredTransactions]);

  const renderTransaction = (item: Transaction) => (
    <TouchableOpacity
      key={item.id}
      style={styles.transactionCard}
      activeOpacity={0.8}
      onPress={() => setSelectedOrderId(item.id)}
    >
      <View style={styles.transactionIconWrap}><MaterialIcons name="restaurant" size={22} color={Colors.primary} /></View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.transactionRestaurant} numberOfLines={1}>{item.restaurant}</Text>
        <Text style={styles.transactionDate}>{formatTxDate(item.date)}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>{`-$${item.amount.toFixed(2)}`}</Text>
        <View style={[styles.statusBadge, item.status === 'ok' ? styles.statusBadgeOk : styles.statusBadgePending]}>
          <Text style={[styles.statusBadgeText, item.status === 'ok' ? styles.statusTextOk : styles.statusTextPending]}>
            {item.status === 'ok' ? 'OK' : 'PEND'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      
      {/* SECCIÓN CABECERA INTERACTIVA */}
      <View style={styles.headerWrapper}>
        <Header title="Historial" showSearch />
        {!isSearching && (
          <TouchableOpacity style={styles.searchActivator} onPress={() => setIsSearching(true)} />
        )}
        {isSearching && (
          <View style={styles.fullSearchBar}>
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchText(''); }}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.inputField}
              placeholder="Buscar plato o restaurante..."
              autoFocus
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialIcons name="close" size={22} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatTitle}>Trayectoria Gastronómica</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatCol}>
                <Text style={styles.heroStatLabel}>TOTAL PEDIDOS</Text>
                <Text style={[styles.heroStatNumber, { color: Colors.primary }]}>{stats.totalPedidos}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatCol}>
                <Text style={styles.heroStatLabel}>AHORRO TOTAL</Text>
                <Text style={[styles.heroStatNumber, { color: Colors.tertiary }]}>${formatCurrency(stats.totalAhorro)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.eliteCard}>
            <View style={styles.eliteIcon}><MaterialIcons name="workspace-premium" size={28} color={Colors.onPrimaryContainer} /></View>
            <Text style={styles.eliteTitle}>Elite</Text>
            <Text style={styles.eliteSubtitle}>{stats.ordersLeft} para premio</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer} style={styles.filtersScroll}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]} onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Historial Detallado</Text>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((item) => renderTransaction(item))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="info-outline" size={40} color={Colors.outline} />
              <Text style={styles.emptyText}>No se encontraron resultados</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE SEGUIMIENTO EN TIEMPO REAL (T13 - RFM14) */}
      {selectedOrderId && (
        <Modal
          visible={Boolean(selectedOrderId)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedOrderId(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderTitleWrap}>
                  <MaterialIcons name="track-changes" size={22} color={Colors.primary} />
                  <Text style={styles.modalHeaderTitle}>Seguimiento en Vivo</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedOrderId(null)}
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <PedidoStatusTracker initialOrderId={selectedOrderId} compact={true} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  
  // ESTILOS DE BÚSQUEDA INTERACTIVA
  headerWrapper: { position: 'relative', zIndex: 100 },
  searchActivator: {
    position: 'absolute',
    right: 85, // Posicionamiento sobre la lupa de tu imagen
    top: 10,
    width: 45,
    height: 45,
    borderRadius: 22,
    zIndex: 101,
  },
  fullSearchBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 70,
    zIndex: 102,
    elevation: 4,
  },
  inputField: { flex: 1, marginLeft: 15, fontSize: 16, color: '#000', fontWeight: '500' },

  scroll: { flex: 1 },
  statsContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 20, marginBottom: 16 },
  heroStatCard: { flex: 2, backgroundColor: '#FFF', borderRadius: BorderRadius.xxl, padding: 16, elevation: 3 },
  heroStatTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroStatCol: { flex: 1 },
  heroStatLabel: { fontSize: 8, fontWeight: '700', color: '#888' },
  heroStatNumber: { fontSize: 24, fontWeight: '800' },
  heroStatDivider: { width: 1, height: 30, backgroundColor: '#EEE', marginHorizontal: 10 },
  eliteCard: { flex: 0.8, backgroundColor: Colors.inverseSurface, borderRadius: BorderRadius.xxl, padding: 10, alignItems: 'center', justifyContent: 'center' },
  eliteIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  eliteTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  eliteSubtitle: { fontSize: 9, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  filtersScroll: { maxHeight: 48, marginBottom: 8 },
  filtersContainer: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.xl, backgroundColor: '#F5F5F5' },
  filterChipActive: { backgroundColor: '#FFF', elevation: 3 },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#888' },
  filterChipTextActive: { color: Colors.primary, fontWeight: '700' },
  listSection: { paddingHorizontal: 20, paddingTop: 8 },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  transactionIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionName: { fontSize: 14, fontWeight: '600' },
  transactionRestaurant: { fontSize: 11, color: '#888' },
  transactionDate: { fontSize: 11, color: '#888' },
  transactionRight: { alignItems: 'flex-end', gap: 4 },
  transactionAmount: { fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusBadgeOk: { backgroundColor: Colors.tertiaryContainer },
  statusBadgePending: { backgroundColor: Colors.primaryContainer },
  statusBadgeText: { fontSize: 8, fontWeight: '700' },
  statusTextOk: { color: Colors.onTertiaryContainer },
  statusTextPending: { color: Colors.onPrimaryContainer },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#888', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 31, 5, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xxl,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    marginBottom: 8,
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  modalCloseBtn: {
    padding: 4,
  },
});
